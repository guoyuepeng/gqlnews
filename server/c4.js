import express from 'express';
import graphqlHTTP from 'express-graphql';
import { GraphQLInt, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList } from 'graphql';
import { find } from 'lodash';


// chunks, lazy evaluated.
function getComments(commentID) {
	const comments = commentsList.filter(comment => comment.parent === commentID);
	if (comments.length > 0){
		return comments;
	}
	return null;

}

const userType = new GraphQLObjectType({
	name: 'User',
	fields: () => ({
		id: { type: GraphQLInt },
		username: { type: GraphQLString },
		about: { type: GraphQLString },
	}),

});


const commentsType = new GraphQLObjectType({
	name: 'Comments',
	fields: () => ({
		id: { type: GraphQLInt },
		parent: { type: commentsType },
		comments: {
			type: new GraphQLList(commentsType),
			args: {
				id: { type: GraphQLInt },
			},
			resolve: (_, { id }) => getComments(id),
		},
		author: {
			type: userType,
			args: {
				author: { type: GraphQLInt },
			},
			resolve: (_, { author }) => find(users, { id: author }),
		},
		content: { type: GraphQLString },
	}),
});

const linkType = new GraphQLObjectType({
	name: 'Link',
	fields: () => ({
		id: { type: GraphQLInt },
		url: { type: GraphQLString },
		description: { type: GraphQLString },
		author: {
			type: userType,
			args: {
				author: { type: GraphQLInt },
			},
			resolve: (_, { author }) => find(users, { id: author }),
		},
		comments: {
			type: new GraphQLList(commentsType),
			resolve: (_, { comments }) => comments.map(i => find(commemntsList, { id: i })),
		},
	}),

});


const queryType = new GraphQLObjectType({
	name: 'Query',
	fields: () => ({
		allLinks: {
			type: new GraphQLList(linkType),
			resolve: () => links,
		},
		link:{
			type: linkType,
			args: {
				id: { type: GraphQLInt },
			},
			resolve: (_, { id }) => find(links, { id }),
		},
		allUsers: {
			type: new GraphQLList(userType),
			resolve: () => users,
		},

		user: {
			type: userType,
			args: {
				id: { type: GraphQLInt },
			},
			resolve: (_, { id }) => find(users, { id }),
		},
	}),
});


const links = [
	{ id: 0, author: 0, url: 'https://google.com', description: 'Google', comments: [0, 4]},
	{ id: 1, author: 1, url: 'https://facebook.com', description: 'Facebook'},
];


const commentsList = [
	{ id: 0, parent: -1, author: 0, content: 'Comment 0' },
	{ id: 1, parent: 0, author: 1, content: 'Comment 1' },
	{ id: 2, parent: 1, author: 0, content: 'Comment 2' },
	{ id: 3, parent: 0, author: 2, content: 'Comment 3' },
	{ id: 4, parent: -1, author: 2, content: 'Comment 4' },
	
];

const users = [
	{ id: 0, username: 'user1', about: 'the first user' },
	{ id: 1, username: 'user2', about: 'the second user' },
	{ id: 2, username: 'user3', about: 'the third user' },
];

const schema = new GraphQLSchema({ query: queryType });

const app = express();

app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));

app.listen(8888, () => console.log('running at localhost:8888/graphql'));



