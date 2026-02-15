import os
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib

data = pd.read_csv("dataset/productivity_data_250.csv")

X = data[["avg_time", "deadlines_met", "tasks_completed"]]
y = data["productive"]


X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = LogisticRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("Model Accuracy:", accuracy)
os.makedirs("models", exist_ok=True)

model_path = os.path.join("models", "productivity_model.pkl")
joblib.dump(model, model_path)

print(f"Model saved at: {model_path}")
