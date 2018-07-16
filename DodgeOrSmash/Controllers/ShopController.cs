using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Migrations;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using DodgeOrSmash.Models;
using Microsoft.Ajax.Utilities;

namespace DodgeOrSmash.Controllers
{
    public class ShopController : Controller
    {
        private readonly ApplicationDbContext db = new ApplicationDbContext();

        // GET: shop
        public ActionResult Index()
        {
            var skins = db.Skins
                .Select(h => new SkinDTO
                {
                    Id = h.Id,
                    Name = h.Name,
                    Price = h.Price,
                    ImagePath = h.ImagePath
                }).OrderByDescending(c => c.Price).ToList();

            return View(skins);
        }

        [HttpPost]
        public ActionResult Edit(int price, int id)
        {
            if (User.IsInRole("Admin"))
            {
                if (price < 0 || id == 0)
                {
                    return RedirectToAction("Index", "Shop");
                }

                var skinId = db.Skins.Single(u => u.Id == id);
                    
                    if (ModelState.IsValid)
                    {
                        skinId.Price = price;
                        db.Entry(skinId).State = EntityState.Modified;
                        db.SaveChanges();

                        return RedirectToAction("Index", "Shop");

                    }
     
            }
         return RedirectToAction("Index", "Shop");
        }

        public ActionResult Buy(int id)
        {
            if (Request.IsAuthenticated && (User.IsInRole("Player") || User.IsInRole("Admin")))
            {
                if (id == null || id == 0)
                {
                    return RedirectToAction("Index", "Shop");
                }

                var currentUserId = User.Identity.GetUserId();


                var user = db.Users.Single(u => u.Id == currentUserId);
                var skin = db.Skins.Single(u => u.Id == id);

                //verificar se pode comprar
                if (user.Wallet - skin.Price > 0)
                {

                    Purchase model = new Purchase
                    {
                        Date = DateTime.Now,
                        UserFK = user.Id,
                        SkinFK = id
                    };

                    db.Purchase.Add(model);

                    Inventory inventory = new Inventory
                    {
                        SkinFK = skin.Id,
                        UserFK = user.Id,
                        IsActive = false
                    };

                    db.Inventory.Add(inventory);

                    if (ModelState.IsValid)
                    {
                        user.Wallet = (user.Wallet - skin.Price);
                        db.Entry(user).State = EntityState.Modified;

                        db.SaveChanges();

                        return RedirectToAction("Index", "Shop");
                    }
                }
            }

            return RedirectToAction("Index", "Shop");

        }


        [HttpPost]
        public ActionResult Activate(int id)
        {
            if (!Request.IsAuthenticated || (!User.IsInRole("Player") && !User.IsInRole("Admin")))
                return RedirectToAction("Index", "Shop");
            if (id == 0)
            {
                return RedirectToAction("Index", "Shop");
            }

            var currentUserId = User.Identity.GetUserId();

            var inventory = db.Inventory.Where(u => u.UserFK == currentUserId).ToList();
            var active = db.Users.FirstOrDefault(u => u.Id == currentUserId);


            foreach (var i in inventory)
            {
                if (i.SkinFK == id && i.IsActive == false)
                {
                    i.IsActive = true;
                    active.ActiveSkin = i.Skin.Name;

                    db.Entry(active).State = EntityState.Modified;

                    db.Users.AddOrUpdate(active);
                }
                else if (i.SkinFK != id)
                    i.IsActive = false;

                db.Entry(i).State = EntityState.Modified;
                db.Inventory.AddOrUpdate(i);
            }

            db.SaveChanges();

            return RedirectToAction("Index", "Shop");

        }



        // part of the recommended Disposable pattern
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

    }
}