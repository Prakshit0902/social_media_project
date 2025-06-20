const credentials = {
  defaultPassword: "password123",
  userCount: 200,
  postsPerUser: { min: 5, max: 20 },
  storiesPerUser: { min: 0, max: 3 },
  commentsPerPost: { min: 0, max: 15 },
  messagesPerChat: { min: 10, max: 50 },
  testUsers: [
    {
      username: "john_doe",
      email: "john@example.com",
      fullname: "John Doe",
      isVerified: true
    },
    {
      username: "jane_smith",
      email: "jane@example.com",
      fullname: "Jane Smith",
      isVerified: true
    },
    {
      username: "mike_wilson",
      email: "mike@example.com",
      fullname: "Mike Wilson",
      isVerified: false
    },
    {
      username: "sarah_jones",
      email: "sarah@example.com",
      fullname: "Sarah Jones",
      isVerified: false
    },
    {
      username: "alex_brown",
      email: "alex@example.com",
      fullname: "Alex Brown",
      isVerified: true
    }
  ]
};

export default credentials