export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '签亭',
      navigationBarBackgroundColor: '#e8e3da',
      navigationBarTextStyle: 'black',
      backgroundColor: '#e8e3da',
      enableShareAppMessage: true,
      enableShareTimeline: true
    })
  : {
      navigationBarTitleText: '签亭',
      navigationBarBackgroundColor: '#e8e3da',
      navigationBarTextStyle: 'black',
      backgroundColor: '#e8e3da',
      enableShareAppMessage: true,
      enableShareTimeline: true
    }
