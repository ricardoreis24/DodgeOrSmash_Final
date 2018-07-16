using DodgeOrSmash.Models;
using System.Data.Entity.Migrations;

namespace DodgeOrSmash.Migrations
{


    public class Configuration : DbMigrationsConfiguration<ApplicationDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }
    }
}
