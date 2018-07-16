using DodgeOrSmash.Models;
using System.Linq;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;

namespace DodgeOrSmash.Controllers
{
    public class PlayController : Controller
    {

        private readonly ApplicationDbContext db = new ApplicationDbContext();

        // GET: Play
        public ActionResult Index()
        {
            if (User.Identity.IsAuthenticated)
            {
                var userId = User.Identity.GetUserId();
                var user = db.Users.FirstOrDefault(u => u.Id == userId);

                ViewBag.skin = user.ActiveSkin;
            }
            else
            {
                ViewBag.skin = "default";
            }

            return View();
        }

        [HttpGet]
        public ActionResult UpdateScore()
        {
            return RedirectToAction("Index", "Play");
        }

        //Post: Score
        [HttpPost]
        public ActionResult UpdateScore(long HighestScore)
        {
            if (User.Identity.IsAuthenticated)
            {
                var userId = User.Identity.GetUserId();
                var user = db.Users
                .Where(u => u.Id == userId).FirstOrDefault();

                if (HighestScore > user.HighestScore)
                    user.HighestScore = HighestScore;
                user.Wallet = user.Wallet + HighestScore / 10;

                db.SaveChanges();
            }

            return RedirectToAction("Index","Play");
        }
    }
}