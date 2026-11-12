import { graphql } from 'msw';
import { setupServer } from 'msw/node';
import {
  fireEvent,
  renderCustomView,
  screen,
  waitFor,
} from '@commercetools-frontend/application-shell/test-utils';
import ApplicationRoutes from '../../routes';
import { productIdFromHostUrl } from './style-content';

const PRODUCT_ID = 'b01c2b0b-a1c2-4a0d-8c8d-a6cce1f42b9b';
const hostUrl = `https://mc.europe-west1.gcp.commercetools.com/hb_trial_2026/products/${PRODUCT_ID}/general`;
const object = {
  __typename: 'CustomObject',
  id: 'a785b736-0ae0-48f4-9ec2-6aafe1dd7200',
  version: 3,
  container: 'style-content',
  key: 'hbeu50543312',
  value: {
    description: { 'en-US': 'Slim fit trousers', 'de-DE': 'Slim-Fit-Hose' },
    details: { 'en-US': ['Slim fit', 'Regular rise'], 'de-DE': ['Slim Fit'] },
    material: { 'en-US': '95% Cotton', 'de-DE': '95 % Baumwolle' },
    care: {
      'en-US': ['Machine wash at 30°C'],
      'de-DE': ['Maschinenwäsche bei 30 °C'],
    },
  },
};
const colour = (label: string) => ({
  masterData: {
    current: {
      masterVariant: {
        attributesRaw: [{ name: 'color', value: { key: label, label } }],
      },
    },
  },
  id: label,
  key: label,
});

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockReads = () =>
  server.use(
    graphql.query('FetchStyleContent', (_req, res, ctx) =>
      res(
        ctx.data({
          product: {
            id: PRODUCT_ID,
            masterData: {
              staged: {
                name: 'Slim-fit gabardine trousers',
                masterVariant: {
                  attributesRaw: [
                    { name: 'style-content', referencedResource: object },
                  ],
                },
              },
            },
          },
        })
      )
    ),
    graphql.query('FetchSharedProducts', (_req, res, ctx) =>
      res(
        ctx.data({
          products: { total: 2, results: [colour('Black'), colour('White')] },
        })
      )
    )
  );
const render = (manage: boolean) =>
  renderCustomView({
    locale: 'en',
    projectKey: 'hb_trial_2026',
    customViewHostUrl: hostUrl,
    projectAllAppliedPermissions: [
      { name: 'canView', value: true },
      { name: 'canManage', value: manage },
    ],
    children: <ApplicationRoutes />,
  });

it('reads the product id from the Merchant Center URL', () => {
  expect(productIdFromHostUrl(hostUrl)).toBe(PRODUCT_ID);
  expect(
    productIdFromHostUrl('https://mc.example.com/p/categories/123')
  ).toBeUndefined();
});

it('shows the shared content and which colour products share it', async () => {
  mockReads();
  render(true);
  await screen.findByText('Shared style content');
  expect(
    await screen.findByText(/Shared by 2 products: Black, White/)
  ).toBeInTheDocument();
  expect(screen.getAllByDisplayValue('Slim fit trousers').length).toBe(1);
  expect(screen.getByDisplayValue('95% Cotton')).toBeInTheDocument();
});

it('saves an edit once, with the Custom Object version and the whole value', async () => {
  mockReads();
  let draft:
    | { container: string; key: string; version: number; value: string }
    | undefined;
  server.use(
    graphql.mutation('UpdateStyleContent', (req, res, ctx) => {
      draft = req.variables.draft;
      return res(
        ctx.data({
          createOrUpdateCustomObject: {
            id: object.id,
            version: 4,
            key: object.key,
          },
        })
      );
    })
  );
  render(true);
  const material = await screen.findByDisplayValue('95% Cotton');
  fireEvent.change(material, { target: { value: '96% Cotton, 4% Elastane' } });
  fireEvent.click(screen.getByText('Save shared content'));
  await waitFor(() => expect(draft).toBeDefined());
  expect(draft).toMatchObject({
    container: 'style-content',
    key: 'hbeu50543312',
    version: 3,
  });
  expect(JSON.parse(draft!.value).material['en-US']).toBe(
    '96% Cotton, 4% Elastane'
  );
  expect(JSON.parse(draft!.value).care['de-DE']).toEqual([
    'Maschinenwäsche bei 30 °C',
  ]);
});

it('is read-only without the manage permission', async () => {
  mockReads();
  render(false);
  await screen.findByText('Shared style content');
  expect(
    await screen.findByText('You can view this content but not edit it.')
  ).toBeInTheDocument();
  expect(screen.queryByText('Save shared content')).not.toBeInTheDocument();
});
