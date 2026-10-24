
import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";

const API_URL = "http://localhost:3002/notifications";

// Formater la date et l'heure
function formatNotificationDate(dateString) {
  const date = new Date(dateString);

  const datePart = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const timePart = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return `${datePart} à ${timePart}`;
}

function Notifications({ onLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!active) return;

        if (response.status === 401) {
          onLogout();
          return;
        }

        if (!response.ok) {
          throw new Error("Impossible de charger les notifications.");
        }

        const data = await response.json();

        if (active) {
          setNotifications(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      active = false;
    };
  }, [onLogout]);

  async function handleMarkAsRead(id) {
    if (updatingId !== null) return;

    setUpdatingId(id);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Impossible de marquer la notification comme lue."
        );
      }

      const updatedNotification = await response.json();

      setNotifications(current =>
        current.map(notification =>
          notification.id === id
            ? updatedNotification
            : notification
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main>
      <PageHeader onLogout={onLogout} />

      <h1>Mes notifications</h1>

      {error && <p role="alert">{error}</p>}

      {isLoading ? (
        <p>Chargement des notifications...</p>
      ) : notifications.length === 0 ? (
        <p>Aucune notification pour le moment.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map(notification => (
            <li key={notification.id} className={`notification-item ${notification.is_read ? "" : "unread"}`}>
              <p>{notification.message}</p>

              <p>
                Statut : {notification.is_read ? "Lue" : "Non lue"}
              </p>

              <p>
                {formatNotificationDate(notification.created_at)}
              </p>

              {!notification.is_read && (
                <button
                  type="button"
                  disabled={updatingId !== null}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  {updatingId === notification.id
                    ? "Enregistrement..."
                    : "Marquer comme lue"}
                </button>
              )}

              <hr />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default Notifications;
