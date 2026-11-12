import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { useCustomViewContext } from '@commercetools-frontend/application-shell-connectors';
import { DOMAINS } from '@commercetools-frontend/constants';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import MultilineTextField from '@commercetools-uikit/multiline-text-field';
import { ContentNotification } from '@commercetools-uikit/notifications';
import PrimaryButton from '@commercetools-uikit/primary-button';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import TextField from '@commercetools-uikit/text-field';
import { PERMISSIONS } from '../../constants';
import { getErrorMessage } from '../../helpers';
import {
  useSharedProducts,
  useStyleContent,
  useUpdateStyleContent,
} from '../../hooks/use-style-content';
import type { SharedProduct, StyleContentValue } from '../../types';
import messages from './messages';

/** The product being viewed is the id in the Merchant Center URL the view is embedded in. */
export const productIdFromHostUrl = (hostUrl?: string) =>
  hostUrl?.match(/\/products\/([0-9a-f-]{36})/i)?.[1];

const lines = (list: string[] | undefined) => (list ?? []).join('\n');
const toList = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

const StyleContent = () => {
  const intl = useIntl();
  const showNotification = useShowNotification();
  const { hostUrl, languages } = useCustomViewContext((c) => ({
    hostUrl: c.hostUrl,
    languages: c.project?.languages ?? ['en-US'],
  }));
  const canEdit = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });
  const productId = productIdFromHostUrl(hostUrl);

  const { object, error, loading, refetch } = useStyleContent(productId);
  const { products } = useSharedProducts(object?.id);
  const { save, saving } = useUpdateStyleContent();
  const [draft, setDraft] = useState<StyleContentValue | null>(null);
  useEffect(() => {
    if (object) setDraft(object.value);
  }, [object]);

  const colours = useMemo(
    () =>
      products
        .map((p: SharedProduct) => {
          const c = p.masterData.current?.masterVariant.attributesRaw.find(
            (a: { name: string }) => a.name === 'color'
          )?.value;
          return typeof c === 'object' ? c.label ?? c.key ?? '' : c ?? '';
        })
        .filter(Boolean),
    [products]
  );

  if (!productId) return <Text.Body intlMessage={messages.noProduct} />;
  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <ContentNotification type="error">
        {getErrorMessage(error)}
      </ContentNotification>
    );
  if (!object || !draft) return <Text.Body intlMessage={messages.noContent} />;

  const set = (
    field: keyof StyleContentValue,
    lang: string,
    value: string | string[]
  ) =>
    setDraft({
      ...draft,
      [field]: { ...(draft[field] as Record<string, unknown>), [lang]: value },
    } as StyleContentValue);

  const onSave = async () => {
    try {
      await save(object, draft);
      showNotification({
        kind: 'success',
        domain: DOMAINS.SIDE,
        text: intl.formatMessage(messages.saved),
      });
      await refetch();
    } catch (e) {
      const text = /version/i.test((e as Error).message)
        ? intl.formatMessage(messages.conflict)
        : (e as Error).message;
      showNotification({ kind: 'error', domain: DOMAINS.SIDE, text });
    }
  };

  return (
    <Spacings.Stack scale="l">
      <Spacings.Stack scale="xs">
        <Text.Subheadline as="h4" intlMessage={messages.title} />
        <Text.Detail intlMessage={messages.subtitle} />
        <Text.Detail tone="secondary">
          {intl.formatMessage(messages.sharedBy, { count: products.length })}
          {colours.length ? `: ${colours.join(', ')}` : ''} · style {object.key}
        </Text.Detail>
        {!canEdit && (
          <Text.Detail tone="secondary" intlMessage={messages.readOnly} />
        )}
      </Spacings.Stack>
      {[...new Set([...languages, ...Object.keys(draft.description)])].map(
        (lang) => (
          <Spacings.Stack scale="m" key={lang}>
            <Text.Subheadline as="h5">{lang}</Text.Subheadline>
            <MultilineTextField
              title={intl.formatMessage(messages.description)}
              value={draft.description[lang] ?? ''}
              onChange={(e) => set('description', lang, e.target.value)}
              isReadOnly={!canEdit}
              horizontalConstraint="scale"
            />
            <MultilineTextField
              title={intl.formatMessage(messages.details)}
              value={lines(draft.details[lang])}
              onChange={(e) => set('details', lang, toList(e.target.value))}
              isReadOnly={!canEdit}
              horizontalConstraint="scale"
            />
            <TextField
              title={intl.formatMessage(messages.material)}
              value={draft.material[lang] ?? ''}
              onChange={(e) => set('material', lang, e.target.value)}
              isReadOnly={!canEdit}
              horizontalConstraint="scale"
            />
            <MultilineTextField
              title={intl.formatMessage(messages.care)}
              value={lines(draft.care[lang])}
              onChange={(e) => set('care', lang, toList(e.target.value))}
              isReadOnly={!canEdit}
              horizontalConstraint="scale"
            />
          </Spacings.Stack>
        )
      )}
      {canEdit && (
        <PrimaryButton
          label={intl.formatMessage(messages.save)}
          onClick={onSave}
          isDisabled={saving}
        />
      )}
    </Spacings.Stack>
  );
};
StyleContent.displayName = 'StyleContent';

export default StyleContent;
