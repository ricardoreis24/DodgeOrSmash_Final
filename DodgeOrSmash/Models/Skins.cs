using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace DodgeOrSmash.Models
{
    public class Skin
    {
        [Key]
        public int Id { get; set; }

        public string Name { set; get; }

        public decimal Price { get; set; }

        public string ImagePath { get; set; }
    }


    public class SkinDTO
    {
        public int Id { get; set; }

        public string Name { set; get; }

        public decimal Price { get; set; }

        public string ImagePath { get; set; }
    }
}