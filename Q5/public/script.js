$(document).ready(function () {
    // Registration form submission
    $('#registerForm').submit(function (e) {
        e.preventDefault();
        $.post('/api/register', $(this).serialize(), function (response) {
            alert(response.message);
            window.location.href = 'login.html'; // Redirect to login after registration
        }).fail(function () {
            alert('Registration failed');
        });
    });

    // Login form submission
    $('#loginForm').submit(function (e) {
        e.preventDefault();
        $.post('/api/login', $(this).serialize(), function (response) {
            localStorage.setItem('token', response.token);
            alert('Logged in successfully');
            window.location.href = 'students.html'; // Redirect to students page after login
        }).fail(function () {
            alert('Login failed');
        });
    });

    // Fetch students
    $('#fetchStudents').click(function () {
        $.ajax({
            url: '/api/students',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: function (students) {
                $('#studentsList').empty();
                students.forEach(student => {
                    $('#studentsList').append(`<div>${student.name} ${student.email} ${student.age}</div>`);
                });
            },
            error: function () {
                alert('Error fetching students');
            }
        });
    });
});
