/// <reference path="../../../@types/commercetools__sync-actions/index.d.ts" />
/// <reference path="../../../@types-extensions/graphql-ctp/index.d.ts" />

import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { STYLE_CONTENT_ATTRIBUTE } from '../../constants';
import type {
  FetchSharedProductsData,
  FetchStyleContentData,
  StyleContentValue,
} from '../../types';
import FetchSharedProducts from './fetch-shared-products.ctp.graphql';
import FetchStyleContent from './fetch-style-content.ctp.graphql';
import UpdateStyleContent from './update-style-content.ctp.graphql';

const context = { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM };

/** The Custom Object a product's `style-content` reference attribute points to, resolved in one request. */
export const useStyleContent = (productId?: string) => {
  const { data, error, loading, refetch } = useMcQuery<
    FetchStyleContentData,
    { id: string }
  >(FetchStyleContent, {
    variables: { id: productId ?? '' },
    skip: !productId,
    context,
  });
  const attr =
    data?.product?.masterData.staged?.masterVariant.attributesRaw.find(
      (a: { name: string }) => a.name === STYLE_CONTENT_ATTRIBUTE
    );
  return {
    object: attr?.referencedResource ?? null,
    productName: data?.product?.masterData.staged?.name ?? '',
    error,
    loading,
    refetch,
  };
};

/** Every colour product that points to the same style content. */
export const useSharedProducts = (customObjectId?: string) => {
  const where = `masterData(current(masterVariant(attributes(name="${STYLE_CONTENT_ATTRIBUTE}" and value(id="${customObjectId}")))))`;
  const { data, loading, refetch } = useMcQuery<
    FetchSharedProductsData,
    { where: string }
  >(FetchSharedProducts, {
    variables: { where },
    skip: !customObjectId,
    context,
  });
  return {
    products: data?.products.results ?? [],
    total: data?.products.total ?? 0,
    loading,
    refetch,
  };
};

/** Saves the shared content; the Custom Object version makes concurrent edits fail instead of overwriting each other. */
export const useUpdateStyleContent = () => {
  const [mutate, { loading }] = useMcMutation<
    { createOrUpdateCustomObject: { id: string; version: number } },
    { draft: unknown }
  >(UpdateStyleContent, { context });
  const save = (
    object: { container: string; key: string; version: number },
    value: StyleContentValue
  ) =>
    mutate({
      variables: {
        draft: {
          container: object.container,
          key: object.key,
          version: object.version,
          value: JSON.stringify(value),
        },
      },
    });
  return { save, saving: loading };
};
