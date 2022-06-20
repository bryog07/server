import { ApolloServer,UserInputError, gql} from 'apollo-server'
import {v1 as uuid} from 'uuid'


const persons = [{"name":"Midu","phone":"843-1234567","street":"Street frontend","city":"Barcelona","id":"3d594650-3435-11e3-dc43-3e40fr34s879"},
        {"name":"Youseff","phone":"843-1231413","street":"Street backend","city":"Madrid","id":"2s394650-3435-11e3-dc43-3e40fr34s129"},
        {"name":"Itzi","street":"fullstack","city":"Mallorca","id":"99994650-3435-11e3-dc43-3e40fr34s879"}]

const typeDefinitions = gql`
  enum YesNo{
    YES
    NO
  }
  type Address{
    street:String!
    city:String!
  }
  type Person { 
    name:String!
    phone:String
    street:String!
    address:Address!
    id: ID!
  }

  type Query {
      personCount: Int!
      allPersons(phone: YesNo): [Person]!
      findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name:String!
      phone:String
      street:String!
      city:String!
    ): Person
    editNumber(
      name:String!
      phone:String!
    ): Person
  }
`

const resolvers = {
  Query:{
    personCount: () => persons.length,
    allPersons: (root, args) => {
      if(!args.phone) return persons
      
      const byPhone = person =>
        args.phone === "YES" ? person.phone : !person.phone

        return persons.filter(byPhone)
    },
    findPerson: (root, args) => {
        const {name} = args
        return persons.find(person => person.name === name)
    }
  },
  Mutation: {
    addPerson: (root, args) => {
      if(persons.find(p => p.name ===args.name)){
        throw new UserInputError('Name must be unique', {
          invalidArgs: args.name
        })
      }
      const person = {...args, id: uuid()}
      persons.push(person) //Update database with new person
      return person
    },
    editNumber: (root, args) => {
      const personIndex = persons.findIndex(p => p.name === args.name)
      if (personIndex === -1) return null 
      
      const person = persons[personIndex]

      const updatePerson = {...person, phone: args.phone}
      persons[personIndex] = updatePerson

      return updatePerson
    }
  },
  Person : {
    address: (root) => {
      return {
        street: root.street,
        city: root.city 
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers
});

server.listen().then(({url}) => {
  console.log(`Server ready at ${url}`)
});