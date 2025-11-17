using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Model.Dto
{
    public class ResetPasswordDto
    {
        [Required]
        public string UserId { get; set; }

        [Required]
        [MinLength(6)]
        public string OldPassword { get; set; }
        
        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }
        [Required]
        [Compare("NewPassword", ErrorMessage = "Confirm Password must match New Password.")]
        public string ConfirmPassword { get; set; }
    }

    public class UserResetPassword
    {
        [Required]
        public string UserId { get; set; }
        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }
        [Required]
        [Compare("NewPassword", ErrorMessage = "Confirm Password must match New Password.")]
        public string ConfirmPassword { get; set; }
    }
}
