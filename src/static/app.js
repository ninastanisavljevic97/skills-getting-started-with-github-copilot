document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list

      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Add pretty participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";
        participantsSection.innerHTML = `<strong>Participants:</strong>`;
        if (details.participants.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "participants-list no-bullets";
          details.participants.forEach((participant) => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.alignItems = "center";
            // Participant email
            const span = document.createElement("span");
            span.textContent = participant;
            // Delete icon
            const delBtn = document.createElement("button");
            delBtn.innerHTML = "&#128465;"; // Trash can emoji
            delBtn.title = "Remove participant";
            delBtn.className = "delete-participant-btn";
            delBtn.style.marginLeft = "8px";
            delBtn.style.background = "none";
            delBtn.style.border = "none";
            delBtn.style.cursor = "pointer";
            delBtn.style.color = "#c62828";
            delBtn.style.fontSize = "1em";
            delBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              if (!confirm(`Remove ${participant} from ${name}?`)) return;
              try {
                const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(participant)}`, {
                  method: "POST",
                });
                const result = await response.json();
                if (response.ok) {
                  messageDiv.textContent = result.message || "Participant removed.";
                  messageDiv.className = "success";
                  fetchActivities();
                } else {
                  messageDiv.textContent = result.detail || "Failed to remove participant.";
                  messageDiv.className = "error";
                }
                messageDiv.classList.remove("hidden");
                setTimeout(() => {
                  messageDiv.classList.add("hidden");
                }, 5000);
              } catch (error) {
                messageDiv.textContent = "Error removing participant.";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
                setTimeout(() => {
                  messageDiv.classList.add("hidden");
                }, 5000);
              }
            });
            li.appendChild(span);
            li.appendChild(delBtn);
            ul.appendChild(li);
          });
          participantsSection.appendChild(ul);
        } else {
          const none = document.createElement("span");
          none.textContent = " None yet!";
          participantsSection.appendChild(none);
        }
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add minimal styling for participants section and hide bullets
      if (!document.getElementById("participants-section-style")) {
        const style = document.createElement("style");
        style.id = "participants-section-style";
        style.textContent = `
          .participants-section {
            margin-top: 0.5em;
            padding: 0.5em 0.8em;
            background: #f7f7fa;
            border-radius: 6px;
            border: 1px solid #e0e0ef;
          }
          .participants-section strong {
            display: block;
            margin-bottom: 0.3em;
            color: #333;
            font-size: 1em;
          }
          .participants-list {
            margin: 0;
            padding-left: 0;
            list-style: none;
          }
          .participants-list li {
            font-size: 0.97em;
            color: #555;
            margin-bottom: 0.1em;
          }
          .delete-participant-btn {
            margin-left: 8px;
            background: none;
            border: none;
            cursor: pointer;
            color: #c62828;
            font-size: 1em;
          }
          .delete-participant-btn:hover {
            color: #a31515;
          }
        `;
        document.head.appendChild(style);
      }
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list to show new participant
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
