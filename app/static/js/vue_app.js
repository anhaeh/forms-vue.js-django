window.Event = new Vue();

/* generic classes */
class Errors {
	constructor() {
		this.errors = {};
	}
	set(errors) {
		this.errors = errors;
	}
	has(field) {
		return this.errors.hasOwnProperty(field);
	}
	any() {
		return Object.keys(this.errors).length > 0;
	}
	get(field) {
		if(this.errors[field]) {
			return this.errors[field][0]
		}
	}
	clear(field) {
		delete this.errors[field];
	}
}

class Form {
	constructor(data) {
		this.originalData = data;
		this.errors = new Errors();
		for (let field in data) {
            this[field] = data[field];
        }
	}
	reset() {
		for (let field in this.originalData) {
			this[field] = '';
		}
	}
	data() {
		let data = Object.assign({}, this);
		delete data.originalData;
		delete data.errors;
		return data
	}
	submit(method, url) {
		axios({
		  method: method,
		  url: url,
		  data: this.data()
		})
		.then(response => this.callback(response.data))
		.catch(response => console.log('submit error: '+ response))
	}
	callback(data) {
		if (data.errors) {
			this.errors.set(data.errors);
		} else {
			Event.$emit("submit", data);
			this.reset();
		}
	}
}

/* Vue Components */
Vue.component('project', {
	props: { project: {'required': true }},
	template: `
		<article class="message">
		  <div class="message-header">
			<p v-text="project.fields.name"></p>
			<button v-on:click="deleteProject()" class="delete"></button>
		  </div>
		  <div class="message-body" v-text="project.fields.description">
		  </div>
		</article>`,
	methods: {
        deleteProject() {
            axios.delete('/projects/', {
                data: { pk: this.project.pk }
            })
			.then(response => Event.$emit("delete", this.project))
			.catch(response => console.log('error: ' + response))
        }
    }
});

Vue.component('project-list', {
	data() {
		return {
			projects: []
		}
	},
	mounted() {
		axios.get('/projects/')
		.then(response => this.projects = response.data)
		.catch(response => console.log('error: '+ response))
	},
	created() {
		Event.$on("delete", (project) => {
			let index = this.projects.indexOf(project);
			this.projects.splice(index, 1);
		});
		Event.$on("submit", (data) => this.projects.push(data[0]) );
	},
});

/* Vue App */
app = new Vue({
	el: '#app',
	data: {
		form: new Form({
			name: '',
			description: ''
		})
	},
	methods: {
		addProject() {
			this.form.submit('POST', '/projects/');
		}
	},
	delimiters: ['((','))']
});