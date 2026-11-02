export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '本心',
      navigationBarBackgroundColor: '#e8e3da',
      navigationBarTextStyle: 'black',
      backgroundColor: '#e8e3da'
    })
  : {
      navigationBarTitleText: '本心',
      navigationBarBackgroundColor: '#e8e3da',
      navigationBarTextStyle: 'black',
      backgroundColor: '#e8e3da'
    }