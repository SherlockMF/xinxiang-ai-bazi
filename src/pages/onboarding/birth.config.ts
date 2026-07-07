export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '录入生辰',
      navigationBarBackgroundColor: '#e8e3da',
      navigationBarTextStyle: 'black',
      backgroundColor: '#e8e3da'
    })
  : {
      navigationBarTitleText: '录入生辰',
      navigationBarBackgroundColor: '#e8e3da',
      navigationBarTextStyle: 'black',
      backgroundColor: '#e8e3da'
    }