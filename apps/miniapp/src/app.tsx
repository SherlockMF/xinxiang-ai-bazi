import { PropsWithChildren } from 'react';
import { useLaunch } from '@tarojs/taro';
import { LucideTaroProvider } from 'lucide-react-taro';
import '@/app.css';
import { Toaster } from '@/components/ui/toast';
import { useUserStore } from '@/stores';
import { Preset } from './presets';

const App = ({ children }: PropsWithChildren) => {
  // 小程序启动 / 冷启动时从本地存储恢复用户与八字档案，
  // 避免刷新或重新打开后丢失出生信息、需重新录入。
  useLaunch(() => {
    useUserStore.getState().loadUserProfile();
  });

  return (
    <LucideTaroProvider defaultColor="#000" defaultSize={24}>
      <Preset>{children}</Preset>
      <Toaster />
    </LucideTaroProvider>
  );
};

export default App;
