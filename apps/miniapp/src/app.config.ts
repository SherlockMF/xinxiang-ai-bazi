export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/onboarding/birth',
    'pages/profile/bazi',
    'pages/profiles/index',
    'pages/fortune/today',
    'pages/chat/index',
    'pages/share/index',
    'pages/favorites/index',
    'pages/reminder/index',
    'pages/me/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#e8e3da',
    navigationBarTitleText: '心象',
    navigationBarTextStyle: 'black'
  },
  // tabBar：今日 / 追问 / 签亭 / 我的（收藏已并入「我的」）
  // 注意：tabBar 内的页面只能用 Taro.switchTab 跳转，
  // 非 tabBar 页面（如 onboarding/birth、profile/bazi、favorites、reminder）用 navigateTo / redirectTo。
  tabBar: {
    color: '#968e7f',
    selectedColor: '#3f7a78',
    backgroundColor: '#e8e3da',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/fortune/today',
        text: '今日',
        iconPath: './assets/tabbar/sparkles.png',
        selectedIconPath: './assets/tabbar/sparkles-active.png'
      },
      {
        pagePath: 'pages/chat/index',
        text: '问心',
        iconPath: './assets/tabbar/message-circle.png',
        selectedIconPath: './assets/tabbar/message-circle-active.png'
      },
      {
        pagePath: 'pages/share/index',
        text: '签亭',
        iconPath: './assets/tabbar/scroll.png',
        selectedIconPath: './assets/tabbar/scroll-active.png'
      },
      {
        pagePath: 'pages/me/index',
        text: '本心',
        iconPath: './assets/tabbar/user.png',
        selectedIconPath: './assets/tabbar/user-active.png'
      }
    ]
  }
})
