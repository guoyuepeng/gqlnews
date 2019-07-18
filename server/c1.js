import express from 'express';
import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';

const schema = buildSchema(`
	type Link {
		_id: Int!
		url: String!
		description: String!
	}
	
	type Query {
		links: [Link!]!
		link(_id: Int!): Link!
	}

`);

const links = [
	{ _id: 0, url: 'https://example.com', description: ' website1 '},
	{ _id: 1, url: 'https://example.net', description: ' website2 '},
]

const root = {
	links: () => links, 
	link: ({ _id }) => {
		const link = links.filter( i => i._id === _id)[0];
		return link;
	},
};

const app = express();

app.use('/graphql', graphqlHTTP({ schema, rootValue: root, graphiql: true}));

app.listen(8888, () => console.log('running on localhost:8888/graphql'));


