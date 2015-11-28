/**
 * Controller
 * @doc http://sailsjs.org/documentation/concepts/controllers
 */
 
function say(callback, text)
{
	console.log('say :', text);
	SpeakService.say(text);
	setTimeout(function(){callback();}, text.length * 100);
}

module.exports = {
	/**
	 * Get programme tv to show in Dashboard
	 * @method index
	 * @param {} req
	 * @param {} res
	 * @return
	 */
	indexProgrammes: function(req, res) {
		var request = "SELECT p.id, c.nomChaine, p.nomProgramme, p.heureDebut, p.typeProgramme, p.descriptif ";
		request += "FROM programmetv p ";
		request += "INNER JOIN programmetvchaine c ";
		request += "ON c.id = p.chaine ";
		request += "WHERE c.afficherDansDashboard = 1 ";
		request += "ORDER BY c.ordreAffichage";
		
		ProgrammeTv.query(request, function(err, programmestv){
			if(err) return res.json(err);

			res.json(programmestv);
		});
	},
	
	/**
	 * Get programme tv to show in Dashboard
	 * @method index
	 * @param {} req
	 * @param {} res
	 * @return
	 */
	indexChaines: function(req, res) {
		var request = "SELECT c.id, c.nomChaine, c.afficherDansDashboard ";
		request += "FROM programmetvchaine c ";
		request += "ORDER BY c.ordreAffichage";
		
		ProgrammeTvChaine.query(request, function(err, chainestv){
			if(err) return res.json(err);

			res.json(chainestv);
		});
	},
	
	/**
	 * @method update
	 * @param req
	 * @param res
	 * @param next
	 */
	updateAffichage : function(req, res, next) {
		var chaine = {
			afficherDansDashboard: req.param('afficherDansDashboard')
		};
		
		ProgrammeTvChaine.update({id: req.param('id')}, chaine, function(err, chaine){
			if(err)
				return res.json(400, err);
				
			sails.log.info("Update " + JSON.stringify(chaine));
			
			return res.json(chaine);
		});
	},
	
	/**
	 * @method ecouterDescriptifProgramme
	 * @param req
	 * @param res
	 * @param next
	 */
	ecouterDescriptifProgramme : function(req, res, next) {
		var descriptif = 'Sur ' + req.param('nomChaine') + ' à ' + req.param('heureDebut') + ' : ' + req.param('nomProgramme') + '.';
		descriptif += req.param('descriptif').replace(/<\/?[^>]+(>|$)/g, " ");
		
		sails.log.info("[ProgrammeTV] " + descriptif);
		SpeakService.say(descriptif);
	},
	
	/**
	 * @method ecouterListeProgrammes
	 * @param req
	 * @param res
	 */
	ecouterListeProgrammes : function(req, res) {
		var request = "SELECT c.nomChaine, p.nomProgramme, p.heureDebut ";
		request += "FROM programmetv p ";
		request += "INNER JOIN programmetvchaine c ";
		request += "ON c.id = p.chaine ";
		request += "WHERE c.afficherDansDashboard = 1 ";
		request += "ORDER BY c.ordreAffichage";
		
		console.log('Debut ecouterListeProgrammes');
		
		ProgrammeTv.query(request, function(err, programmestv){
			var operations = [];
			
			for (var i = 0; i < programmestv.length; i++)
			{
				var heure = programmestv[i].heureDebut.replace(":", " teure ");
				var texte = "Sur " + programmestv[i].nomChaine + " à " + heure + " : " + programmestv[i].nomProgramme;
				
				operations.push(say.bind(null, function(textCallback){console.log('OK pour : ', textCallback);}, texte));
				console.log('Préparation : ', texte);
			}

			async.series(operations, function(err){
				if(err)return console.log('err :', err);
				console.log('success');
			});
		});
	}
};