import express from 'express';
import graphqlHTTP from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { find } from 'lodash';

const typeDefs = `
	type Link {
		id: Int! @unique
		url: String!
		description: String
		#Nested query
		author: User!
		comments: [Comment]
	}
	
	type User {
		id: Int! @unique
		username: String!
		about: String!
	}
	
	type Comment {
		id: Int! @unique
		parent: Comment
		comments: [Comment]
		author: User!
		content: String!
	}

	type Query {
		allLinks: [Link]
		link(id: Int!): Link
		allUsers: [User]
		user(id: Int!): User
	}
`;

// chunks, lazy evaluated.
function getComments(commentID) {
	const comments = commentsList.filter(comment => comment.parent === commentID);
	if (comments.length > 0){
		return comments;
	}
	return null;

}

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

const resolvers = {
	Query: {
		allLinks: () => links,
		link: (obj, args, context, info) => find(links, {id: args.id}),
		allUsers: () => users,
		user: (obj, args, context, info) => find(users, {id: args.id}),
	},
	//This is for nested query!
	Link: {
		author: ({ author }) => find(users, {id: author }),
		comments: ({ comments }) => comments.map(i => 
 find(commentsList, {id: i })),
	},

	//This is recursive query	:: 
	Comment: {
		author: ({ author }) => find(users, {id: author}),
		comments: ({ id }) => getComments(id), 
	}
};


const schema = makeExecutableSchema( {typeDefs, resolvers });

const app = express();

app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));

app.listen(8888, () => console.log('running at localhost:8888/graphql'));



