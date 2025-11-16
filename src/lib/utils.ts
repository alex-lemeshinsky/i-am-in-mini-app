import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Manifest } from '@farcaster/miniapp-core/src/manifest';
import {
  APP_BUTTON_TEXT,
  APP_DESCRIPTION,
  APP_ICON_URL,
  APP_NAME,
  APP_OG_IMAGE_URL,
  APP_PRIMARY_CATEGORY,
  APP_SPLASH_BACKGROUND_COLOR,
  APP_SPLASH_URL,
  APP_TAGS,
  APP_URL,
  APP_WEBHOOK_URL,
  APP_ACCOUNT_ASSOCIATION,
} from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type MiniAppEmbedOptions = {
  imageUrl?: string;
  buttonTitle?: string;
  actionUrl?: string;
  splashImageUrl?: string;
  splashBackgroundColor?: string;
};

export function getMiniAppEmbedMetadata(options: MiniAppEmbedOptions = {}) {
  const {
    imageUrl,
    buttonTitle = APP_BUTTON_TEXT,
    actionUrl = APP_URL,
    splashImageUrl = APP_SPLASH_URL,
    splashBackgroundColor = APP_SPLASH_BACKGROUND_COLOR,
  } = options;

  const resolvedImage = imageUrl ?? APP_OG_IMAGE_URL;

  return {
    version: '1',
    imageUrl: resolvedImage,
    ogTitle: APP_NAME,
    ogDescription: APP_DESCRIPTION,
    ogImageUrl: resolvedImage,
    button: {
      title: buttonTitle,
      action: {
        type: 'launch_miniapp',
        name: APP_NAME,
        url: actionUrl,
        splashImageUrl,
        iconUrl: APP_ICON_URL,
        splashBackgroundColor,
        description: APP_DESCRIPTION,
        primaryCategory: APP_PRIMARY_CATEGORY,
        tags: APP_TAGS,
      },
    },
  };
}

export async function getFarcasterDomainManifest(): Promise<Manifest> {
  return {
    accountAssociation: APP_ACCOUNT_ASSOCIATION!,
    miniapp: {
      version: '1',
      name: APP_NAME ?? 'Neynar Starter Kit',
      homeUrl: APP_URL,
      iconUrl: APP_ICON_URL,
      imageUrl: APP_OG_IMAGE_URL,
      buttonTitle: APP_BUTTON_TEXT ?? 'Launch Mini App',
      splashImageUrl: APP_SPLASH_URL,
      splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
      webhookUrl: APP_WEBHOOK_URL,
    },
  };
}
