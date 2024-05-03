// $(document).ready(function() {
    var resetForm = document.getElementById('reset-form')
    var resetButton = document.getElementById('submit-button')
    var queryString = window.location.search
    var params = URLSearchParams(queryString)
    var token = params.get('token')
    var userId = params.get('id')
    var baseUrl = 'http://localhost:3001/api/auth/resetPassword'
    var password = document.getElementById("new-password")
    var newPassword = document.getElementById('confirm-password')
    var error = document.getElementById('err')

    var setError =  function(es) {
        error.innerHTML = es
        setTimeout(() => {
          error.innerHTML = ''
        }, 3000)
        throw new Error(es)
    }

    $("#reset-form").submit(function(e) {
        e.preventDefault()
        console.log("hello world")
        // if(password.value !== newPassword.value ){
        //     setError('password doesnot match')
        // }
        // $post(`${baseUrl}`,{
        //     token: token,
        //     password: password.value,
        //     userId: userId
        // },function(data, status) {
        //     if(parseInt(status) > 200){
        //         setError('something wrong')
        //     }
        //     window.location.href = "http://localhost:5173/";
        // })
    })
// })