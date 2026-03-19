from sklearn.metrics import accuracy_score
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import joblib
import pandas as pd 
df = pd.read_csv("D:/Performix/backend/dataset/employee_firing_dataset.csv")
X=df.drop(['fired'],axis=1)
Y=df['fired']
X_train,X_test,Y_train,Y_test=train_test_split(X,Y,random_state=42,test_size=0.2)
model=LogisticRegression()
model.fit(X_train,Y_train)
print("Trained model accuracy score :"+str(accuracy_score(Y_test,model.predict(X_test))*100)+"%")
joblib.dump(model,"D:/Performix/backend/models/firing_model.pkl")