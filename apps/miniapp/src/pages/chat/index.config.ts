export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '问心',
      navigationBarBackgroundColor: '#e8e3da',
      navigationBarTextStyle: 'black',
      backgroundColor: '#e8e3da'
    })
  : {
      navigationBarTitleText: '问心',
      navigationBarBackgroundColor: '#e8e3da',
      navigationBarTextStyle: 'black',
      backgroundColor: '#e8e3da'
    }