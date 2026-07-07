export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '本心档案',
      navigationBarBackgroundColor: '#e8e3da',
      navigationBarTextStyle: 'black',
      backgroundColor: '#e8e3da'
    })
  : {
      navigationBarTitleText: '本心档案',
      navigationBarBackgroundColor: '#e8e3da',
      navigationBarTextStyle: 'black',
      backgroundColor: '#e8e3da'
    }
