export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '灵频档案',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#0f172a'
    })
  : {
      navigationBarTitleText: '灵频档案',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#0f172a'
    }