using DodgeOrSmash.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DodgeOrSmash.Controllers
{
    public class ScoreBoardController : Controller
    {
        private readonly ApplicationDbContext db = new ApplicationDbContext();
        // GET: scoreboard
        public ActionResult Index()
        {
            var highestScores = db.Users.Take(5)
                .Select(h => new ScoreBoard{
                    UserName = h.UserName,
                    Score= h.HighestScore
                }).OrderByDescending(c => c.Score).ToList();

            return View(highestScores);
        }
    }
}