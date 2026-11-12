import { defineMessages } from 'react-intl';

export default defineMessages({
  title: { id: 'StyleContent.title', defaultMessage: 'Shared style content' },
  subtitle: {
    id: 'StyleContent.subtitle',
    defaultMessage:
      'Edited once, shown on every colour of this style. Changes apply to the products below as soon as you save.',
  },
  sharedBy: {
    id: 'StyleContent.sharedBy',
    defaultMessage:
      'Shared by {count, plural, one {# product} other {# products}}',
  },
  description: {
    id: 'StyleContent.description',
    defaultMessage: 'Description',
  },
  details: {
    id: 'StyleContent.details',
    defaultMessage: 'Details (one per line)',
  },
  material: { id: 'StyleContent.material', defaultMessage: 'Material' },
  care: {
    id: 'StyleContent.care',
    defaultMessage: 'Care instructions (one per line)',
  },
  save: { id: 'StyleContent.save', defaultMessage: 'Save shared content' },
  saved: {
    id: 'StyleContent.saved',
    defaultMessage: 'Shared style content saved',
  },
  conflict: {
    id: 'StyleContent.conflict',
    defaultMessage:
      'Someone else changed this content. Reload the page and try again.',
  },
  noContent: {
    id: 'StyleContent.noContent',
    defaultMessage:
      'This product has no shared style content (attribute "style-content" is empty).',
  },
  noProduct: {
    id: 'StyleContent.noProduct',
    defaultMessage: 'Open a product to see its shared style content.',
  },
  readOnly: {
    id: 'StyleContent.readOnly',
    defaultMessage: 'You can view this content but not edit it.',
  },
});
