from sklearn.linear_model import LinearRegression 
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import pandas as pd 
import joblib
df=pd.read_csv("D:/Performix/backend/dataset/performance_salary_dataset.csv")
X=df.drop(['salary'],axis=1)
Y=df['salary']
X_train,X_test,Y_train,Y_test=train_test_split(X,Y,random_state=42,test_size=0.2)
model = LinearRegression()
model.fit(X_train,Y_train)
print("MSE: "+str(mean_squared_error(Y_test,model.predict(X_test))*100)+"%")
joblib.dump(model,"D:/Performix/backend/models/salary_calculator")