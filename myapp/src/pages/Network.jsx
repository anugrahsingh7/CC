// Network.jsx
import React from "react";
import PostCard from "../components/PostCard";
import Group from "../components/Group"; // Import the Group component

const Network = () => {
  const posts = [
    {
      avatar: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWVuJTIwc3VpdHxlbnwwfHwwfHx8MA%3D%3D",
      username: "John Doe",
      time: "Posted 2 hours ago",
      content: "Just another day with adorable kittens! 🐱",
      imageUrl: "https://images.pexels.com/photos/1308881/pexels-photo-1308881.jpeg?cs=srgb&dl=pexels-soldiervip-1308881.jpg&fm=jpg",
      likes: 42,
      comments: 3,
    },
    {
      avatar: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWVuJTIwc3VpdHxlbnwwfHwwfHx8MA%3D%3D",
      username: "Jane Smith",
      time: "Posted 5 hours ago",
      content: "Life is better with kittens 🐾",
      imageUrl: "https://www.pix-star.com/blog/wp-content/uploads/2021/05/digital-photo-frames.jpg",
      likes: 30,
      comments: 5,
    },
    // Add more posts as needed
  ];

  const groups = [
    { name: "Cat Lovers", members: 150, topic: "Cats and Kittens" },
    { name: "Kittens Club", members: 200, topic: "All About Kittens" },
    // Add more groups as needed
  ];

  return (
    <div className=" min-h-screen py-4 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
        {/* Left Column for Posts */}
        <div className="lg:w-3/4 w-full flex flex-col space-y-6 items-center justify-center">
       <div className=""></div>
          {posts.map((post, index) => (
            <PostCard
              key={index}
              avatar={post.avatar}
              username={post.username}
              time={post.time}
              content={post.content}
              imageUrl={post.imageUrl}
              likes={post.likes}
              comments={post.comments}
            />
          ))}
        </div>

        {/* Separator Line */}
        <div className="w-full lg:w-px  lg:block hidden"></div>

        {/* Right Column for Groups */}
        <div className="lg:w-1/4 w-full flex flex-col space-y-6 ">
        <div className="font-bold text-xl ">Join Community Groups</div>
          {groups.map((group, index) => (
            <Group key={index} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Network;
