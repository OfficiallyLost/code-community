async function checkFields()
{

    let usernameField = document.getElementById("username").value;
    let passwordField = document.getElementById("password").value;
    let usernameErrField = document.getElementById("details-username-err");
    let passwordErrField = document.getElementById("details-password-err");

    if(usernameField == "") usernameErrField.innerHTML = "Username field cannot be empty.";
    if(passwordField == "") passwordErrField.innerHTML = "Password field cannot be empty.";
    if(usernameField.split("").length <= 7) usernameErrField.innerHTML = "Username has to be longer than 7 words.";
    if(passwordField.split("").length <= 7) passwordErrField.innerHTML = "Password has to be longer than 8 words.";

    else
    {

        // Fields are filled in properly, handle the account creation somehow.

    }

}