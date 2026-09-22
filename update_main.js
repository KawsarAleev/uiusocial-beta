const fs = require('fs');

let content = fs.readFileSync('js/main.js', 'utf8');

// Replace renderPosts
content = content.replace(/function renderPosts[\s\S]*?(?=\n\/\/ Setup create post)/, `async function renderPosts(filterKeyword = "") {
    const postsContainer = document.getElementById("posts-container");
    if (!postsContainer) return;
    
    try {
        const response = await fetch('api/posts/get_posts.php');
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        
        const posts = data.posts || [];
        postsContainer.innerHTML = "";

        const filteredPosts = posts.filter(post =>
            post.content.toLowerCase().includes(filterKeyword.toLowerCase()) ||
            post.author.toLowerCase().includes(filterKeyword.toLowerCase())
        );

        filteredPosts.forEach(post => {
            const postElement = document.createElement("div");
            postElement.className = "card post-card mb-3";
            postElement.setAttribute("data-id", post.id);

            const badgeClass = post.role === "FACULTY" ? "faculty" : "student";
            const imageHTML = post.image ? \`<img src="\${post.image}" alt="Post Image" class="post-image mt-2">\` : "";

            const commentsListHTML = (post.comments || []).map(comment => \`
                <div class="comment-item d-flex gap-2 mt-2 align-items-start">
                    <img src="\${comment.avatar}" alt="User" class="avatar" style="width: 28px; height: 28px; object-fit: cover;">
                    <div class="comment-body">
                        <div class="fw-600 text-sm"><a href="profile.html?id=\${comment.author_id}" class="user-profile-link" style="color: inherit; text-decoration: none;">\${escapeHTML(comment.author)}</a></div>
                        <div class="text-sm">\${escapeHTML(comment.text)}</div>
                    </div>
                </div>
            \`).join("");

            postElement.innerHTML = \`
                <div class="post-header justify-content-between d-flex">
                    <div class="d-flex gap-2">
                        <img src="\${post.avatar}" alt="User" class="avatar" style="object-fit: cover;">
                        <div>
                            <div class="post-author fw-600"><a href="profile.html?id=\${post.author_id}" class="user-profile-link" style="color: inherit; text-decoration: none;">\${escapeHTML(post.author)}</a> <span class="badge \${badgeClass}">\${post.role}</span></div>
                            <div class="post-meta text-muted text-sm">\${escapeHTML(post.dept)} • \${post.time}</div>
                        </div>
                    </div>
                    <i class="fa-solid fa-flag text-muted action-flag" style="cursor: pointer;" title="Report this post"></i>
                </div>
                <div class="post-content mt-2">
                    <p class="m-0">\${escapeHTML(post.content)}</p>
                    \${imageHTML}
                </div>
                <div class="post-footer mt-3 d-flex justify-content-between align-items-center">
                    <div class="d-flex gap-3">
                        <span class="post-stat btn-like \${post.liked ? 'text-primary' : ''}" style="cursor: pointer;">
                            <i class="\${post.liked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up"></i> 
                            <span class="like-count">\${post.likes}</span>
                        </span>
                        <span class="post-stat btn-comment-toggle" style="cursor: pointer;">
                            <i class="fa-regular fa-comment"></i> 
                            <span class="comment-count">\${(post.comments || []).length}</span>
                        </span>
                    </div>
                    <i class="fa-solid fa-share-nodes text-muted btn-share" style="cursor: pointer;"></i>
                </div>

                <div class="comments-section mt-3 pt-3 border-top" style="display: none;">
                    <div class="comments-list">
                        \${commentsListHTML}
                    </div>
                    <div class="d-flex gap-2 mt-3">
                        <img src="\${window.currentUser?.avatar || 'assets/images/students/default.png'}" alt="User" class="avatar" style="width: 32px; height: 32px; object-fit: cover;">
                        <input type="text" class="form-control comment-input" placeholder="Write a comment..." style="font-size: 14px; border-radius: 20px;">
                        <button type="button" class="btn btn-primary btn-add-comment btn-sm" style="border-radius: 20px; padding: 4px 14px;">Send</button>
                    </div>
                </div>
            \`;

            postsContainer.appendChild(postElement);
        });
    } catch (e) {
        console.error("Error loading posts:", e);
        postsContainer.innerHTML = '<div class="text-center text-muted">Failed to load posts.</div>';
    }
}`);

// Replace setupCreatePost logic for posting
content = content.replace(/postBtn\.addEventListener\("click", \(\) => \{[\s\S]*?(?=\n\}\);)/, `postBtn.addEventListener("click", async () => {
        const text = postInput.value.trim();

        if (!text && !uploadedBase64Image) {
            alert("Please enter text or upload an image to post.");
            return;
        }

        const formData = new FormData();
        formData.append('content', text);
        
        if (mediaInput && mediaInput.files[0]) {
            formData.append('image', mediaInput.files[0]);
        } else if (uploadedBase64Image) {
            formData.append('image_url', uploadedBase64Image); // Handle case where image was provided as URL/base64
        }

        try {
            const res = await fetch('api/posts/create_post.php', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (data.success) {
                postInput.value = "";
                uploadedBase64Image = null;
                if (mediaInput) mediaInput.value = "";
                if (previewContainer) previewContainer.style.display = "none";
                renderPosts();
            } else {
                alert(data.error || 'Failed to create post');
            }
        } catch (e) {
            console.error('Error creating post:', e);
            alert('An error occurred');
        }
`);

// Replace toggleLike
content = content.replace(/function toggleLike[\s\S]*?(?=\n\/\/ Add comment)/, `async function toggleLike(postId) {
    try {
        const res = await fetch('api/posts/like_post.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({post_id: postId})
        });
        const data = await res.json();
        
        if (data.success) {
            const card = document.querySelector(\`.post-card[data-id="\${postId}"]\`);
            if (card) {
                const likeBtn = card.querySelector('.btn-like');
                const countSpan = likeBtn.querySelector('.like-count');
                const icon = likeBtn.querySelector('i');
                
                countSpan.textContent = data.likes;
                if (data.status === 'liked') {
                    likeBtn.classList.add('text-primary');
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                } else {
                    likeBtn.classList.remove('text-primary');
                    icon.classList.add('fa-regular');
                    icon.classList.remove('fa-solid');
                }
            }
        } else {
            console.error(data.error);
        }
    } catch (e) {
        console.error('Error toggling like:', e);
    }
}
`);

// Replace addComment
content = content.replace(/function addComment[\s\S]*?(?=\n\/\/ Discover view HTML)/, `async function addComment(postId, text) {
    try {
        const res = await fetch('api/posts/add_comment.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({post_id: postId, content: text})
        });
        const data = await res.json();
        
        if (data.success) {
            const targetCard = document.querySelector(\`.post-card[data-id="\${postId}"]\`);
            if (targetCard) {
                const commentsList = targetCard.querySelector(".comments-list");
                const commentInput = targetCard.querySelector(".comment-input");
                const commentCountSpan = targetCard.querySelector(".comment-count");
                
                commentInput.value = "";
                
                const c = data.comment;
                const newCommentHtml = \`
                    <div class="comment-item d-flex gap-2 mt-2 align-items-start">
                        <img src="\${c.avatar}" alt="User" class="avatar" style="width: 28px; height: 28px; object-fit: cover;">
                        <div class="comment-body">
                            <div class="fw-600 text-sm"><a href="profile.html?id=\${c.author_id}" class="user-profile-link" style="color: inherit; text-decoration: none;">\${escapeHTML(c.author)}</a></div>
                            <div class="text-sm">\${escapeHTML(c.text)}</div>
                        </div>
                    </div>
                \`;
                commentsList.insertAdjacentHTML('beforeend', newCommentHtml);
                
                // Update comment count
                const currentCount = parseInt(commentCountSpan.textContent) || 0;
                commentCountSpan.textContent = currentCount + 1;
            }
        } else {
            alert(data.error || 'Failed to add comment');
        }
    } catch (e) {
        console.error('Error adding comment:', e);
    }
}
`);

fs.writeFileSync('js/main.js', content);
