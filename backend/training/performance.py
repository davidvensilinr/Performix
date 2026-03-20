from sklearn.neighbors import KNeighborsClassifier
import pandas as pd 
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split 
from sklearn.preprocessing import StandardScaler 
import joblib 
model = KNeighborsClassifier(n_neighbors=5,metric="cosine")
scaler = StandardScaler()
df = pd.read_csv("D:/Performix/backend/dataset/knn_employee_dataset.csv")
X=df.drop(['performance_label'],axis=1)
y=df['performance_label']
X_train,X_test,y_train,y_test = train_test_split(X,y,random_state=42,test_size=0.2)
X_train=scaler.fit_transform(X_train)
X_test=scaler.fit_transform(X_test)
model.fit(X_train,y_train)
print("Accuracy score of your model : "+str(accuracy_score(y_test,model.predict(X_test))*100)+"%")
joblib.dump(model,"D:/Performix/backend/models/performance_analyser.pkl")