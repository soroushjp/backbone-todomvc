// App view
var app = app || {};


app.AppView = Backbone.View.extend({
	el: '#todoapp',
	statsTemplate: _.template($('#stats-template').html()),
	events: {
		'keypress #new-todo': 'createOnEnter',
		'click #clear-completed': 'clearCompleted',
		'click #toggle-all': 'toggleAllComplete'
	},
	initialize: function() {
		this.allCheckbox = this.$('#toggle-all')[0];
		this.$input = this.$('#new-todo');
		this.$footer = this.$('#footer');
		this.$main = this.$('#main');
		// Listen to Todos collection
		this.listenTo(app.todos, 'add', this.addOne);
		this.listenTo(app.todos, 'reset', this.addAll);
		this.listenTo(app.todos, 'change:completed', this.filterOne);
		this.listenTo(app.todos, 'filter', this.filterAll);
		this.listenTo(app.todos, 'all', this.render);

		// Grab todos from data source
		console.log("Grabbing todos from data source ...");
		app.todos.fetch({reset: true});
	},
	render: function() {
		console.log("Rendering app view ...");
		var completed = app.todos.completed.length;
		var remaining = app.todos.remaining.length;
		if (app.todos.length) {
			console.log("Todos found in data store, populating ...");
			this.$main.show();
			this.$footer.show();
			this.$footer.html(this.statsTemplate({
				completed: completed,
				remaining: remaining
			}));
		} else {
			console.log("No todos found in data store.");
			this.$main.hide();
			this.$footer.hide();
		}
		this.$('#filters li a')
			.removeClass('selected')
			.filter('[href="#/' + (app.TodoFilter || '') + '"]')
			.addClass('selected');
	},
	addOne: function(todo) {
		var view = new app.TodoView({ model: todo});
		$("#todo-list").append(view.render().el);
	},
	addAll: function() {
		this.$('#todo-list').html('');
		app.todos.each(this.addOne, this);
	},
	filterOne: function(todo){
		todo.trigger('visible');
	},
	filterAll: function() {
		app.todos.each(this.filterOne, this);
	},
	newAttributes: function() {
		return {
			title: this.$input.val().trim(),
			order: app.todos.nextOrder(),
			completed: false
		};
	},
	createOnEnter: function(e) {
		if (e.which != ENTER_KEY || !this.$input.val().trim()) {
			return;
		}
		app.todos.create(this.newAttributes());
		this.$input.val('');
	},
	clearCompleted: function() {
		_.invoke(app.todos.completed(), 'destroy');
		return false;
	},
	toggleAllComplete: function(todo) {
		var completed = this.allCheckbox.checked;
		app.todos.each(function(todo) {
			todo.save({
				'completed': completed
			});
		});
	}
});
