import os
import requests
import urllib.parse

from flask import redirect, render_template, request, session
from functools import wraps
import numpy as np
import sys



def apology(message, code=400):
    """Render message as an apology to user."""
    def escape(s):
        """
        Escape special characters.

        https://github.com/jacebrowning/memegen#special-characters
        """
        for old, new in [("-", "--"), (" ", "-"), ("_", "__"), ("?", "~q"),
                         ("%", "~p"), ("#", "~h"), ("/", "~s"), ("\"", "''")]:
            s = s.replace(old, new)
        return s
    return render_template("apology.html", top=code, bottom=escape(message)), code

#macro definitions
EMPTY = 0
BRD_SIZE = 144
ROWS = 12
COLUMNS = 12

#define types as numbers
piece_val = {
	"R":0, #white rook
	"N":1, #white knight
	"B":2, #white bishop
    "Q":3, #white queen
    "K":4, #white king
    "P":5, #white pawn
    "r":6, #black rook
    "n":7, #black knight
    "b":8, #black bishop
    "q":9, #black queen
    "k":10, #black king
    "p":11, #black pawn
    0:-1, #empty piece
}

#helper for checking if current player and piece are same
def same(cur, pos):
	if cur == "w":
		return pos.isupper()
	else:
		return pos.islower()

#helper for extracting columns from board
def col(board, j):
	return [row[j] for row in board]

#helper for converting "occupied" 1d array to
def map_occ(arr):
	return [piece_val[piece] for piece in arr]

#helper for converting board to fen
def board_to_fen(board, cur_fen):
	fen = ""
	for i in range(2, 10):
		ctr = 0
		for j in range(2, 10):
			if isinstance(board[i][j], int):
				ctr = ctr + 1
			else:
				if ctr != 0:
					fen = fen +  str(ctr)
					ctr = 0
				fen = fen + board[i][j]
		if ctr != 0:
			fen = fen + str(ctr)
		if i != 9:
			fen = fen + "/"
	if cur_fen[1] == "w":
		fen = fen + " b"
	else:
		fen = fen + " w"
	fen = fen + " KQkq - " + str(int(cur_fen[4])+1) + " " + str(int(cur_fen[5])+1)
	return fen

'''
given a fen_id of 6 inputs:
1. piece input, from white perspective
2. active color (next move)
3. castling availability (not implemented)
4. en passant target square algebraic notation (not implemented)
5. halfclock moves: number of moves since last capture/pawn advance
6. full move number (incremeneted after every black move)
'''
if len(sys.argv) > 1:
	start_fen = sys.argv[1].split(" ")
else:
	start_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1".split()

board_str = start_fen[0].split("/")			#board positions as array
cur_player = start_fen[1]
#initialize board, represented as 12x10 matrix
board = [[0 for x in range(COLUMNS)] for y in range(ROWS)]
#initialize out of range elements
for j in range(COLUMNS):
	board[0][j] = -1
	board[1][j] = -1
	board[10][j] = -1
	board[11][j] = -1
for i in range(ROWS):
	board[i][0] = -1
	board[i][1] = -1
	board[i][10] = -1
	board[i][11] = -1

#array to store positions of all current pieces in play (r, n, b, q, k, p)
cur_pieces = [[], [], [], [], [], []]

#iterate over board string to represent board state
i = 0
for line in board_str:
	j = 0
	while j < len(line):
		if line[j].isdigit():
			j = j + int(i)
			continue
		board[i+2][j+2] = line[j]
		val = piece_val[line[j]]
		if cur_player == "w":
			if line[j].isupper():
				cur_pieces[val].append([i, j])
		else:
			if line[j].islower():
				cur_pieces[val-6].append([i, j])
		j = j + 1
	i = i + 1

#add board move helper
def add_board_move(moves, val, i, j, pawn_diag):
	if val == 0:
		if not pawn_diag:
			moves.append([i, j, -1])
	elif val in piece_val:
		if not same(cur_player, val):		#check if same color
			moves.append([i, j, piece_val[val]])

#moves structure defined as (row, col, capture). capture = -1 if empty
#king's options
def king(pos, board):
	moves = []
	r = pos[0]
	c = pos[1]
	hor = [r-1, r, r+1]
	ver = [c-1, c, c+1]
	#consider any moves that might be checkmate later
	for i in hor:
		for j in ver:
			board_val = board[i+2][j+2]
			add_board_move(moves, board_val, i, j, False)
	return moves


#rook's options
def rook(pos, board):
	moves = []
	r = pos[0]
	c = pos[1]
	#rook's horizontal moves
	hor = np.array(map_occ(board[r+2][2:10])) + 1
	occupied_hor = np.nonzero(hor)[0]
	if(occupied_hor.size == 0):
		for j in range(0, 8):
			if j != c:
				moves.append([r, j, -1])
	else:
		hor_dist = occupied_hor - r
		if(any(hor_dist < 0)):
			left = occupied_hor[np.where(hor_dist < 0, hor_dist, -np.inf).argmax()] + 1
			#check if left is capturable
			left_val = board[r+2][left-1+2]
			add_board_move(moves, left_val, r, left-1, False)
		else:
			left = 0
		if(any(hor_dist > 0)):
			right = occupied_hor[np.where(hor_dist > 0, hor_dist, np.inf).argmin()] - 1
			#check if right is capturable
			right_val = board[r+2][right+1+2]
			add_board_move(moves, right_val, r, right+1, False)
		else:
			right = 7
		for j in range(left, right + 1):
			if j != c:
				moves.append([r, j, -1])

	#rook's vertical moves
	ver = np.array(map_occ(col(board, j+2)[2:10])) + 1
	occupied_ver = np.nonzero(ver)[0]
	if(occupied_ver.size == 0):
		for i in range(0, 8):
			if i != r:
				moves.append([i, c, -1])
	else:
		ver_dist = occupied_ver - c
		if(any(ver_dist < 0)):
			top = occupied_ver[np.where(ver_dist < 0, ver_dist, -np.inf).argmax()] + 1
			#check if top is capturable
			top_val = board[top-1+2][c+2]
			add_board_move(moves, top_val, top-1, c, False)
		else:
			top = 0
		if(any(ver_dist > 0)):
			bottom = occupied_ver[np.where(ver_dist > 0, ver_dist, np.inf).argmin()] - 1
			#check if bottom is capturable
			bottom_val = board[bottom+1+2][c+2]
			add_board_move(moves, bottom_val, bottom+1, c, False)
		else:
			bottom = 7
		for i in range(top, bottom + 1):
			if i != r:
				moves.append([i, c, -1])
	return moves


#bishop's options
def bishop(pos, board):
	moves = []
	r = pos[0]
	c = pos[1]
	#add upper board moves (maximum 8)
	j1 = c-1 #left diagonal
	j2 = c+1 #right diagonal
	for i in range(r-1, -1, -1): #r-1 = row above, 0 = first row
		if(j1 >= 0):
			cur_val = board[i+2][j1+2]
			add_board_move(moves, cur_val, i, j1, False)
			if(piece_val[cur_val] >= 0):
				break;
			j1 = j1 - 1
		if(j2 < 8):
			cur_val = board[i+2][j2+2]
			add_board_move(moves, cur_val, i, j2, False)
			if(piece_val[cur_val] >= 0):
				break;
			j2 = j2 + 1
	#add lower board moves (maximum 8)
	j1 = c-1 #left diagonal
	j2 = c+1 #right diagonal
	for i in range(r+1, 8): #r+1 = row below, 7 = last row
		if(j1 >= 0):
			cur_val = board[i+2][j1+2]
			add_board_move(moves, cur_val, i, j1, False)
			if(piece_val[cur_val] >= 0):
				break;
			j1 = j1 - 1
		if(j2 < 8):
			cur_val = board[i+2][j2+2]
			add_board_move(moves, cur_val, i, j2, False)
			if(piece_val[cur_val] >= 0):
				break;
			j2 = j2 + 1
	return moves

'''
#queen's options (rook + bishop's combined)
def queen(pos, board):
	moves = []
	moves = rook(pos, board) + bishop(pos, board)
'''

#knight's options
def knight(pos, board):
	moves = []
	r = pos[0]
	c = pos[1]
	two = [-2, 2]
	one = [-1, 1]
	for i in two:
		for j in one:
			board_val_1 = board[r+i+2][c+j+2]
			board_val_2 = board[r+j+2][c+i+2]
			add_board_move(moves, board_val_1, r+i, c+j, False)
			add_board_move(moves, board_val_2, r+j, c+i, False)
	return moves

#helper for checking if starting pawn
def st_pawn(r):
	if cur_player == "w":
		return r == 6
	else:
		return r == 1

#pawn's options
def pawn(pos, board):
	moves = []
	r = pos[0]
	c = pos[1]
	valid = []
	if cur_player == "w":
		valid = [-1, -2]
	else:
		valid = [1, 2]
	#return one move ahead
	board_val_1 = board[r+valid[0]+2][c+2]
	add_board_move(moves, board_val_1, r+valid[0], c, False)
	#return two moves ahead if possible
	if st_pawn(r):
		board_val_2 = board[r+valid[1]+2][c+2]
		add_board_move(moves, board_val_2, r+valid[1], c, False)
	#return diagonal move if possible
	board_val_3 = board[r+valid[0]+1][c-1+2]
	board_val_4 = board[r++valid[0]+1][c+1+2]
	add_board_move(moves, board_val_3, r+valid[0], c-1, True)
	add_board_move(moves, board_val_3, r+valid[0], c+1, True)
	return moves


#run tests here
print("king's move", king([0, 4], board))
print("knight's move", knight([0, 1], board))
print("pawn's move", pawn([6, 1], board))
print("rook's move", rook([4,4], board))
print("bishop's move", bishop([4, 4], board))
print(board_to_fen(board, start_fen))
