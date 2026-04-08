"""
Retrains all models and saves .pkl files to backend/models/.
Run this once before starting the server, or as part of the build step.
"""
import os
import pandas as pd
import joblib
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

BASE    = os.path.dirname(__file__)
DATA    = os.path.join(BASE, "dataset")
MODELS  = os.path.join(BASE, "models")
os.makedirs(MODELS, exist_ok=True)

def save(model, name):
    path = os.path.join(MODELS, name)
    joblib.dump(model, path)
    print(f"  saved {name}")

print("Training productivity model...")
df = pd.read_csv(os.path.join(DATA, "productivity_data_250.csv"))
X, y = df[["avg_time","deadlines_met","tasks_completed"]], df["productive"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
m = LogisticRegression()
m.fit(X_train, y_train)
save(m, "productivity_model.pkl")

print("Training firing model...")
df = pd.read_csv(os.path.join(DATA, "employee_firing_dataset.csv"))
X, y = df.drop("fired", axis=1), df["fired"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
m = LogisticRegression()
m.fit(X_train, y_train)
save(m, "firing_model.pkl")

print("Training overtime model...")
df = pd.read_csv(os.path.join(DATA, "overtime_dataset.csv"))
X, y = df.drop("overtime", axis=1), df["overtime"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
m = GaussianNB()
m.fit(X_train, y_train)
save(m, "overtime_decider.pkl")

print("Training performance model (KNN + scaler pipeline)...")
df = pd.read_csv(os.path.join(DATA, "knn_employee_dataset.csv"))
X, y = df.drop("performance_label", axis=1), df["performance_label"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
m = Pipeline([("scaler", StandardScaler()), ("knn", KNeighborsClassifier(n_neighbors=5, metric="cosine"))])
m.fit(X_train, y_train)
save(m, "performance_analyser.pkl")

print("Training promotion model...")
df = pd.read_csv(os.path.join(DATA, "decision_tree_employee_promotion.csv"))
X, y = df.drop("promoted", axis=1), df["promoted"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
m = DecisionTreeClassifier()
m.fit(X_train, y_train)
save(m, "promotion_decision.pkl")

print("Training quitting model...")
df = pd.read_csv(os.path.join(DATA, "employee_attrition_dataset.csv"))
X, y = df.drop("left_company", axis=1), df["left_company"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
m = RandomForestClassifier(n_estimators=100)
m.fit(X_train, y_train)
save(m, "quiting_prediction.pkl")

print("Training salary model...")
df = pd.read_csv(os.path.join(DATA, "performance_salary_dataset.csv"))
X, y = df.drop("salary", axis=1), df["salary"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
m = LinearRegression()
m.fit(X_train, y_train)
save(m, "salary_calculator.pkl")

print("\nAll models trained and saved.")
