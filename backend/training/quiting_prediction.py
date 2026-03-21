from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split 
from sklearn.ensemble import RandomForestClassifier
import pandas as pd 
import joblib 
df=pd.read_csv("D:/Performix/backend/dataset/employee_attrition_dataset.csv")
X=df.drop(["left_company"],axis=1)
y=df["left_company"]
X_train,X_test,y_train,y_test=train_test_split(X,y,test_size=0.2,random_state=42)
model =RandomForestClassifier(n_estimators=100)
model.fit(X_train,y_train)
acc=accuracy_score(y_test,model.predict(X_test))
print("Accuracy Score : "+str(acc*100)+"%")
joblib.dump(model,"D:/Performix/backend/models/quiting_prediction.pkl")
print("Model saved")