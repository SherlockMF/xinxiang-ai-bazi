export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '赛博灵频',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#0f172a'
    })
  : {
      navigationBarTitleText: '赛博灵频',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#0f172a'
    }
