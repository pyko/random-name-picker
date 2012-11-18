$(function() {
	var FADE_DELAY_MS = 800,
		EXTRA_DELAY = 150,
		SHOW_NAME_DELAY = 150,
		MIN_LIST_LENGTH = 60;

	// Super simple model - really just need it for the collection
	var NameEntryModel = Backbone.Model.extend({
		defaults: {
			name: ''
		},

		remove: function() {
			this.destroy();
		}
	});

	// Basic tempalte to allow removing of names if needed
	var NameEntryView = Backbone.View.extend({
		tagName: 'li',
		template: _.template($('#name-entry-template').html()),

		events: {
			'click .remove' : 'remove'
		},

		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		remove: function(){
			this.model.remove();
			this.$el.remove();
		}
	});

	// Basic template for the winner's name
	var NameWinnerView = Backbone.View.extend({
		className: 'winner',
		template: _.template($('#name-winner-template').html()),

		events: {
			'click .remove' : 'remove'
		},

		render: function(){
			this.$el.html(this.template(this.model.toJSON()));
			return this;	
		},

		remove: function(){
			this.model.remove();
			this.$el.remove();
			// total hack, but meah
			$("#blanket").remove();
			$("#selecting-name").removeClass("final-winner")
								.html("<div id='pick-another'>pick another winner...</div>")
		}
	});

	// Collection to hold the name models
	var NameEntryCollection = Backbone.Collection.extend({
		model: NameEntryModel,
		localStorage: new Store('name-entry-list'),
		all: function() {
			return this.filter(function(){
				return true; /* Need to clone the collection */
			})
		}
	});

	var Entries = new NameEntryCollection;

	var App = Backbone.View.extend({
		el: $('#outer-container'),

		events: {
			'keypress #name-input' : 'createEntry',
			'click #pick-winner' : 'pickWinner',
			'click #pick-another' : 'pickWinner',
			'click #clear-all-safety' : 'clearAllSafety',
			'click #clear-all' : 'clearAll'
		},

		initialize: function(){
			this.input = this.$('#name-input');

			Entries.bind('add', this.addEntry, this);
			Entries.bind('reset', this.addAll, this);
			Entries.bind('all', this.render, this);

			Entries.fetch();
		},

		createEntry: function(e){
			if (e.which !== 13) return;
			var inputValue = this.input.val().trim();

			if (!inputValue) return;

			Entries.create({name: inputValue});
			this.input.val('');			
		},

		addEntry: function(nameEntry){
			var view = new NameEntryView({model: nameEntry}),
			    entryListLength = Entries.length,
			    nameListClass;

			// Add to the left/right side of the name list
			if (entryListLength !== 0) {
				var indexOfEntry = _.indexOf(Entries.models, nameEntry);
				nameListClass = (indexOfEntry % 2 === 0) ? '.name-list.left' : '.name-list.right';
			} else {
				nameListClass = (Entries.length % 2 === 0) ? '.name-list.right' : '.name-list.left';
			}
			this.$(nameListClass).prepend(view.render().el);
		},

		addAll: function(){
			Entries.each(this.addEntry);
		},

		render: function() {
			$('.num-entries').text(Entries.length + ' entries');
		},

		getEntries: function() {
			return Entries.all();
		},

		getShuffled: function(){
			// underscore's shuffle uses the Fisher-Yates shuffle
			// should be equiv of picking a name out of a hat
			return _.shuffle(Entries.all());
		},

		getShuffledNames: function(){
			return this.getShuffled().map(function(model){
				// console.log("Name: " + model.get('name'));
				return model.get('name');
			});
		},

		buildDecentShuffledList: function(){
			console.log("Shuffle and build list of names");
			var list = this.getShuffledNames();
			// Keep appending shuffled list until we reach a minimum length
			// min length is only there so the shuffle looks impressive
			while (list.length < MIN_LIST_LENGTH) {
				list = list.concat(this.getShuffledNames());
			}
			console.log("Total list length:" + list.length);
			return list;
		},

		pickWinner: function() {			
			var that = this,
				shuffledNames = this.buildDecentShuffledList();

			console.log("Picking winner...");
			// Clean-up existing space
			if ($("#entry-container").length > 0) {
				$("#entry-container").slideUp(FADE_DELAY_MS, function(){
					$(this).remove();
					$("#winner-container").slideDown(FADE_DELAY_MS, function(){
						$(this).removeClass("hidden");
						that.easingTimeout(that.showNames, shuffledNames, SHOW_NAME_DELAY);
					});
				});
			} else {
				$("#pick-another").fadeOut(FADE_DELAY_MS, function(){
					$(this).remove();
					that.easingTimeout(that.showNames, shuffledNames, SHOW_NAME_DELAY);
				});
			}
			
		},

		showNames: function(names) {
			$("#selecting-name").text(names[0]);
			// console.log("Showed: " + names[0]);
			return names.slice(1);
		},

		easingTimeout: function(callback, names, delay){
			var that = this;
			var internalCallback = function(names, delay){
				return function(){
					if (names && names.length !== 0) {
						if (names.length === 20) {
							delay += EXTRA_DELAY; // Increase overall delay slightly
						}
						if (names.length < 10) {
							delay += 50; // Keep adding to delay, to get the 'slow-down' effect
						}
						names = callback(names);
						setTimeout(internalCallback, delay);
					} else {
						var selectedWinner = $("#selecting-name").text().trim(),
							winner = Entries.where({name: selectedWinner})[0],
							winnerView = new NameWinnerView({model: winner});
						console.log("Winner is: " + selectedWinner);
						$("#selecting-name").html(winnerView.render().el);
						setTimeout(function(){
							$("#selecting-name").addClass("final-winner");
							$("body").append("<div id='blanket'></div>");
						}, 100);
					}
				}
			}(names, delay);

			setTimeout(internalCallback, 0);
		},

		clearAllSafety: function() {
			this.$el.append("<div id='clear-all' class='hidden-trigger'>CLEAR ALL</div>");
			// Give a 3 second delay before removing clear-all switch
			setTimeout(function(){
				$("#clear-all").remove();
			}, 3000);
		},

		clearAll: function() {
			_.each(Entries.all(), function(entry){
				entry.remove();
			})
			$(".name-list").empty();
			$("#clear-all").remove();
			return false;
		}
	});
	
	MyApp = new App;
});

