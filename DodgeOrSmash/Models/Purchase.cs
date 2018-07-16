using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace DodgeOrSmash.Models
{
    public class Purchase
    {

        [Key]
        public int Id { get; set; }

        //atributos espicificos de relacionamento
        //modelo CD

        public decimal Price { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime Date { get; set; }

        public string UserFK { get; set; }
        public int SkinFK { get; set; }

        [ForeignKey("UserFK")]
        public virtual ApplicationUser User { get; set; }

        [ForeignKey("SkinFK")]
        public virtual Skin Skin { get; set; }
        
    }
}