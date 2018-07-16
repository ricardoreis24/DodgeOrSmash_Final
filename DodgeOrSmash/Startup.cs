using DodgeOrSmash.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin;
using Owin;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Linq;

[assembly: OwinStartupAttribute(typeof(DodgeOrSmash.Startup))]
namespace DodgeOrSmash
{
    public partial class Startup
    {
        private readonly ApplicationDbContext context = new ApplicationDbContext();

        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            Seed(context);
        }

        protected void Seed(ApplicationDbContext context)
        {
            var skin = new List<Skin>
            {
                new Skin
                {
                    Id = 1,
                    Name = "default",
                    Price = 0,
                    ImagePath = "default.png",
                }, new Skin
                {
                    Id = 2,
                    Name = "tomas",
                    Price = 5000,
                    ImagePath = "tomas.png",
                }, new Skin
                {
                    Id = 3,
                    Name = "olaf",
                    Price = 1000,
                    ImagePath = "olaf.png",
                }, new Skin
                {
                    Id = 4,
                    Name = "plaka",
                    Price = 500,
                    ImagePath = "plaka.png",
                }, new Skin
                {
                    Id = 5,
                    Name = "hugo",
                    Price = 2000,
                    ImagePath = "hugo.png",
                }, new Skin
                {
                    Id = 6,
                    Name = "oliveti",
                    Price = 7000,
                    ImagePath = "oliveti.png",
                }
            };
            skin.ForEach(aa => context.Skins.AddOrUpdate(a => a.Id, aa));
            context.SaveChanges();

            CreateRolesandUsers(context);

            var inventory = new List<Inventory>
            {
                new Inventory
                {
                    Id = 1,
                    UserFK = "1",
                    SkinFK = 1,
                    IsActive = true
                }
            };
            inventory.ForEach(aa => context.Inventory.AddOrUpdate(a => a.UserFK, aa));
            context.SaveChanges();

            var user = context.Users.Where(u => u.Id == "1").FirstOrDefault();
            user.ActiveSkin = context.Inventory.Where(i => i.UserFK == user.Id && i.IsActive == true).Select(s => s.Skin.Name).FirstOrDefault();
            context.SaveChanges();
            
        }

        // In this method we will create default User roles and Admin user for login   
        private void CreateRolesandUsers(ApplicationDbContext context)
        {
            
            var roleManager = new RoleManager<IdentityRole>(new RoleStore<IdentityRole>(context));
            var UserManager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(context));


            // In Startup I am creating first Admin Role and creating a default Admin User    
            if (!roleManager.RoleExists("Admin"))
            {

                // first we create the Admin role   
                var role = new IdentityRole();
                role.Name = "Admin";
                roleManager.Create(role);

                //Here we create a Admin super user who will maintain the website                                  
                var user = new ApplicationUser();
                user.Id = "1";
                user.UserName = "Ricardo";
                user.Email = "ricardoreis@email.com";
                
                string userPWD = "Asd.123";

                var chkUser = UserManager.Create(user, userPWD);

                //Add default User to Role Admin
                if (chkUser.Succeeded)
                {
                    var result1 = UserManager.AddToRole(user.Id, "Admin");

                }
            }

            // Creating the Player role    
            if (!roleManager.RoleExists("Player"))
            {
                var role = new IdentityRole();
                role.Name = "Player";
                roleManager.Create(role);

            }
        }
    }
}
