.PHONY: dev install-backend install-frontend backend frontend

dev: install-backend install-frontend
	@echo "Starting development servers..."
	@make -j 2 backend frontend

install-backend:
	@echo "Installing backend dependencies..."
	@cd backend && python3 -m pip install -r requirements.txt

install-frontend:
	@echo "Installing frontend dependencies..."
	@cd frontend && npm install

backend:
	@echo "Starting backend server..."
	@cd backend && python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

frontend:
	@echo "Starting frontend server..."
	@cd frontend && npm run dev