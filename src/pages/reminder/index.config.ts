export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '提醒设置',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#0f172a'
    })
  : {
      navigationBarTitleText: '提醒设置',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#0f172a'
    }