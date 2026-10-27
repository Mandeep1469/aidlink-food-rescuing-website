import { MOCK_LISTINGS } from "../data/listings.js";

export default function DashboardPosts() {
  // In a real app this would be filtered to the logged-in user's own posts
  const myPosts = MOCK_LISTINGS.slice(0, 2);

  return (
    <div>
      <h2>My posts</h2>
      {myPosts.length === 0 ? (
        <p className="app-status">You haven't posted any surplus food yet.</p>
      ) : (
        <ul className="dashboard-posts-list">
          {myPosts.map((post) => (
            <li key={post.id}>
              <strong>{post.title}</strong>
              <span className="listing-meta"> · {post.servings} servings · {post.pickupWindow}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
