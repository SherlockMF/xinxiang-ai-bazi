export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/onboarding/birth',
    'pages/profile/bazi',
    'pages/fortune/today',
    'pages/chat/index',
    'pages/favorites/index',
    'pages/reminder/index',
    'pages/me/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTitleText: '赛博灵频',
    navigationBarTextStyle: 'white'
  },
  // tabBar 在用户完成档案生成后才会显示
  // 当前 MVP 版本暂时移除 tabBar，使用普通页面跳转
  tabBar: undefined
})
