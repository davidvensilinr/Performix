from sklearn.naive_bayes import GaussianNB 
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
import pandas as pd 
import joblib
df = pd.read_csv("D:/Performix/backend/dataset/overtime_dataset.csv")
X=df.drop(["overtime"],axis=1)
y=df["overtime"]
X_train,X_test,y_train,y_test=train_test_split(X,y,test_size=0.2,random_state=42)
model = GaussianNB()
model.fit(X_train,y_train)
acc=accuracy_score(y_test,model.predict(X_test))
print("Accuracy :"+str(acc*100)+"%")
joblib.dump(model,"D:/Performix/backend/models/overtime_decider.pkl")
print("Model saved")