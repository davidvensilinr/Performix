from sklearn.metrics import accuracy_score 
from sklearn.model_selection import train_test_split 
from sklearn.tree import DecisionTreeClassifier
import pandas as pd
import joblib  
model=DecisionTreeClassifier()
df=pd.read_csv("D:/Performix/backend/dataset/decision_tree_employee_promotion.csv")
X=df.drop(["promoted"],axis=1)
y=df["promoted"]
X_train,X_test,y_train,y_test=train_test_split(X,y,test_size=0.2,random_state=42)
model.fit(X_train,y_train)
acc=accuracy_score(y_test,model.predict(X_test))
print("Accuracy of the model : "+str(acc*100)+"%")
joblib.dump(model,"D:/Performix/backend/models/promotion_decision.pkl")
print("Model saved")