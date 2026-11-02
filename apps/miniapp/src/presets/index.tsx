import { useLaunch } from '@tarojs/taro';
import { PropsWithChildren, useEffect } from 'react';
import { injectH5Styles } from './h5-styles';
import { devDebug } from './dev-debug';
import { H5Container } from './h5-container';
import {
  H5ErrorBoundary,
  initializeH5ErrorHandling,
} from './h5-error-boundary';
import { IS_H5_ENV } from './env';

// H5 环境的 Preset 组件
const PresetH5 = ({ children }: PropsWithChildren) => {
  initializeH5ErrorHandling();
  
  useEffect(() => {
    devDebug();
    injectH5Styles();
  }, []);

  return (
    <H5ErrorBoundary>
      <H5Container>{children}</H5Container>
    </H5ErrorBoundary>
  );
};

// 小程序环境的 Preset 组件
const PresetMiniApp = ({ children }: PropsWithChildren) => {
  useLaunch(() => {
    devDebug();
    injectH5Styles();
  });

  return <>{children}</>;
};

export const Preset = IS_H5_ENV ? PresetH5 : PresetMiniApp;
