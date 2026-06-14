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
  tabBar: {
    color: '#64748b',
    selectedColor: '#22d3ee',
    backgroundColor: '#0f172a',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/fortune/today',
        text: '灵频',
        iconPath: './assets/tabbar/sparkles.png',
        selectedIconPath: './assets/tabbar/sparkles-active.png'
      },
      {
        pagePath: 'pages/favorites/index',
        text: '收藏',
        iconPath: './assets/tabbar/heart.png',
        selectedIconPath: './assets/tabbar/heart-active.png'
      },
      {
        pagePath: 'pages/chat/index',
        text: '追问',
        iconPath: './assets/tabbar/message-circle.png',
        selectedIconPath: './assets/tabbar/message-circle-active.png'
      },
      {
        pagePath: 'pages/me/index',
        text: '我的',
        iconPath: './assets/tabbar/user.png',
        selectedIconPath: './assets/tabbar/user-active.png'
      }
    ]
  }
})
