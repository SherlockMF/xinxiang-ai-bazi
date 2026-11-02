export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '心象盘',
      navigationBarBackgroundColor: '#e8e3da',
      navigationBarTextStyle: 'black',
      backgroundColor: '#e8e3da'
    })
  : {
      navigationBarTitleText: '心象盘',
      navigationBarBackgroundColor: '#e8e3da',
      navigationBarTextStyle: 'black',
      backgroundColor: '#e8e3da'
    }