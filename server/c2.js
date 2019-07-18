import express from 'express';
import graphqlHTTP from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { find } from 'lodash';

const typeDefs = `
	type Link {
		id: Int! @unique
		url: String!
		description: String
		author: User!
	}
	
	type User {
		id: Int! @unique
		username: String!
		about: String!
	}

	type Query {
		allLinks: [Link]
		link(id: Int!): Link
		allUsers: [User]
		user(id: Int!): User
	}
`;

const links = [
	{ id: 0, author: 0, url: 'https://google.com', description: 'Google'},
	{ id: 1, author: 1, url: 'https://facebook.com', description: 'Facebook'},
];


const users = [
	{ id: 0, username: 'user1', about: 'the first user' },
	{ id: 1, username: 'user2', about: 'the second user' },
];

const resolvers = {
	Query: {
		allLinks: () => links,
		link: (obj, args, context, info) => find(links, {id: args.id}),
		allUsers: () => users,
		user: (obj, args, context, info) => find(users, {id: args.id}),
	},
	Link: {
		author: ({ author }) => find(users, {id: author }),
	},
};


const schema = makeExecutableSchema( {typeDefs, resolvers });

const app = express();

app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));

app.listen(8888, () => console.log('running at localhost:8888/graphql'));



